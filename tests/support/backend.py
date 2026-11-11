"""E2E-only server: real FastAPI/storage, isolated data, explicit provider mode."""
import argparse
import base64
import json
import os
from pathlib import Path
import sys
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument('--real', action='store_true')
parser.add_argument('--auth', action='store_true')
parser.add_argument('--port', type=int, default=8101)
args = parser.parse_args()
root = Path(os.environ.get('IDOC_BACKEND_DIR', Path(__file__).resolve().parents[3] / 'iDoc-server' / 'idoc'))
sys.path.insert(0, str(root))
from xantus.config.settings import Settings, get_settings
from xantus.main import create_app
import uvicorn

# Unique temporary data prevents tests from touching the user's document library.
with tempfile.TemporaryDirectory(prefix='idoc-e2e-') as directory:
    data = Path(directory)
    settings = get_settings().model_copy(deep=True) if args.real else Settings(_env_file=None, base_dir=data)
    settings.data_dir = data
    settings.vector_store.persist_path = data / 'vectors'
    settings.vector_store.collection_name = 'idoc_e2e'
    settings.auth.enabled = args.auth
    settings.server.cors_origins = ['http://localhost:3102'] if args.auth else ['http://localhost:3101']
    if args.auth:
        # Explicit test-only Google provider seam. State, PKCE, cookies, account
        # linking and ownership still run through the real app and SQLite store.
        # Browser tests intercept Google's authorize page; no real Google request
        # or credential is used. Production token verification has separate tests.
        from pydantic import SecretStr
        from xantus.google_auth import GoogleOIDC
        settings.auth.google_client_id = 'test-google-client'
        settings.auth.google_client_secret = SecretStr('test-only-not-a-google-secret')
        settings.auth.google_redirect_uri = 'http://localhost:3102/api/auth/google/callback'

        def fixture_exchange(self, code, nonce, verifier):
            identity = json.loads(base64.urlsafe_b64decode(code + '=' * (-len(code) % 4)))
            if identity.get('nonce') != nonce or not verifier:
                raise ValueError('Invalid test provider nonce or PKCE verifier')
            return {'sub': identity['sub'], 'email': identity['email']}

        GoogleOIDC.exchange = fixture_exchange
    if args.real:
        app = create_app(settings)
    else:
        from tests.fakes import TestEmbedding, TestLLM
        class BrowserTestLLM(TestLLM):
            def chat(self, messages, **kwargs):
                if any("E2E_SLOW_CHAT" in message.content for message in messages):
                    import time
                    time.sleep(3)
                return super().chat(messages, **kwargs)
        app = create_app(settings, llm=BrowserTestLLM(), embedding=TestEmbedding())
    uvicorn.run(app, host='127.0.0.1', port=args.port)

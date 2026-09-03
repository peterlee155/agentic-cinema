import sys
import io
import os

# Capture System / Cloud Run PORT BEFORE load_dotenv() overrides it
system_port = os.environ.get("PORT")

from dotenv import load_dotenv
load_dotenv()

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

if __name__ == "__main__":
    import uvicorn
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    elif system_port:
        port = int(system_port)
    else:
        port = int(os.environ.get("BACKEND_PORT", "9000"))

    print("\n" + "=" * 60)
    print("[*] AGENTIC CINEMA STUDIO -- BACKEND AI ENGINE")
    print(f"[*] Backend API running on: http://localhost:{port}")
    print("=" * 60 + "\n")
    uvicorn.run("server.app:app", host="0.0.0.0", port=port, reload=False)

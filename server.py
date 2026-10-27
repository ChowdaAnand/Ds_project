#!/usr/bin/env python3
"""
DATA SCIENCE DIGITAL LIBRARY PORTAL - Backend Server
Zero-dependency HTTP + REST API Server built on Python standard library.
Supports SQLite database (`student.db`), file uploads, experiment run tracking,
safe code execution fallback, and static asset delivery.
"""
import os
import sys
import json
import base64
import mimetypes
import urllib.parse
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
import database

PORT = int(os.environ.get("PORT", 8000))
HOST = "0.0.0.0"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Initialize database schema
database.init_db()

class DSlabPortalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and disable cache on API calls
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _send_json(self, status_code, data):
        payload = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        raw = self.rfile.read(content_length).decode("utf-8", errors="replace")
        try:
            return json.loads(raw)
        except Exception:
            return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")
        if not path:
            path = "/"

        # API Endpoints
        if path == "/api/profile":
            profile = database.get_profile()
            self._send_json(200, {"success": True, "data": profile})
            return

        elif path == "/api/experiments":
            exps = database.get_experiments()
            self._send_json(200, {"success": True, "data": exps})
            return

        elif path.startswith("/api/experiments/"):
            identifier = path.split("/")[-1]
            exp = database.get_experiment(identifier)
            if exp:
                self._send_json(200, {"success": True, "data": exp})
            else:
                self._send_json(404, {"success": False, "error": f"Experiment '{identifier}' not found"})
            return

        elif path == "/api/stats":
            stats = database.get_stats()
            self._send_json(200, {"success": True, "data": stats})
            return

        elif path == "/api/tools":
            tools = database.get_tools()
            self._send_json(200, {"success": True, "data": tools})
            return

        elif path == "/api/modules":
            modules = database.get_modules()
            self._send_json(200, {"success": True, "data": modules})
            return

        elif path == "/api/resources":
            resources = database.get_resources()
            self._send_json(200, {"success": True, "data": resources})
            return

        elif path.startswith("/api/sample_datasets"):
            parts = path.split("/")
            name = parts[-1] if len(parts) > 3 and parts[-1] else "student_performance.csv"
            raw_csv = database.get_sample_dataset(name)
            self._send_json(200, {"success": True, "name": name, "csv": raw_csv})
            return

        elif path == "/api/runs":
            runs = database.get_experiment_runs(limit=30)
            self._send_json(200, {"success": True, "data": runs})
            return

        elif path.startswith("/api/runs/"):
            exp_id_str = path.split("/")[-1]
            try:
                exp_id = int(exp_id_str)
                runs = database.get_experiment_runs(exp_id=exp_id, limit=20)
                self._send_json(200, {"success": True, "data": runs})
            except ValueError:
                self._send_json(400, {"success": False, "error": "Invalid experiment ID"})
            return

        elif path == "/api/outputs":
            outputs = database.get_experiment_outputs()
            self._send_json(200, {"success": True, "data": outputs})
            return

        elif path.startswith("/api/outputs/"):
            exp_id_str = path.split("/")[-1]
            try:
                exp_id = int(exp_id_str)
                outputs = database.get_experiment_outputs(exp_id=exp_id)
                self._send_json(200, {"success": True, "data": outputs})
            except ValueError:
                self._send_json(400, {"success": False, "error": "Invalid experiment ID"})
            return

        # Serve index.html as fallback for root
        if path == "/":
            self.path = "/index.html"

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")

        # 1. Update Student Profile
        if path == "/api/profile":
            data = self._read_json_body()
            updated = database.update_profile(data)
            self._send_json(200, {
                "success": True,
                "message": "Student profile updated successfully in SQLite database.",
                "data": updated
            })
            return

        # 2. Upload Student Photograph
        elif path == "/api/upload_photo":
            try:
                data = self._read_json_body()
                file_content = data.get("file_content", "")
                if not file_content:
                    self._send_json(400, {"success": False, "error": "Empty file content"})
                    return

                ts = int(datetime.now().timestamp())
                ext = "png"
                if "data:image/jpeg" in file_content or "data:image/jpg" in file_content:
                    ext = "jpg"
                elif "data:image/webp" in file_content:
                    ext = "webp"

                filename = f"profile_{ts}.{ext}"
                file_path = os.path.join(UPLOADS_DIR, filename)

                if "," in file_content:
                    _, b64data = file_content.split(",", 1)
                else:
                    b64data = file_content

                binary = base64.b64decode(b64data)
                with open(file_path, "wb") as f:
                    f.write(binary)

                rel_url = f"uploads/{filename}"
                database.update_profile({"avatar_path": rel_url})
                self._send_json(200, {
                    "success": True,
                    "avatar_path": rel_url,
                    "message": "Profile photo uploaded and saved successfully."
                })
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        # 3. Record Experiment Run Telemetry
        elif path == "/api/runs":
            try:
                data = self._read_json_body()
                exp_id = int(data.get("experiment_id", 1))
                status = data.get("status", "Completed")
                duration_ms = int(data.get("execution_duration_ms", 0))
                stdout = data.get("stdout", "")
                stderr = data.get("stderr", "")
                exit_code = int(data.get("exit_code", 0))

                database.record_experiment_run(
                    exp_id=exp_id,
                    status=status,
                    duration_ms=duration_ms,
                    stdout=stdout,
                    stderr=stderr,
                    exit_code=exit_code
                )
                stats = database.get_stats()
                self._send_json(200, {
                    "success": True,
                    "message": f"Run recorded for Experiment ID {exp_id}",
                    "stats": stats
                })
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        # 4. Upload Experiment Output File (PNG, JPG, CSV, TXT, PDF)
        elif path.startswith("/api/upload_output/"):
            try:
                exp_id_str = path.split("/")[-1]
                exp_id = int(exp_id_str)
                data = self._read_json_body()

                raw_filename = data.get("file_name", f"output_exp{exp_id}.txt")
                file_content = data.get("file_content", "")
                content_type = data.get("content_type", "text/plain")

                # Validation
                allowed_exts = [".png", ".jpg", ".jpeg", ".csv", ".txt", ".pdf", ".svg"]
                _, ext = os.path.splitext(raw_filename.lower())
                if ext not in allowed_exts:
                    self._send_json(400, {
                        "success": False,
                        "error": f"Unsupported file type '{ext}'. Allowed: PNG, JPG, JPEG, CSV, TXT, PDF, SVG."
                    })
                    return

                ts = int(datetime.now().timestamp())
                safe_name = f"exp{exp_id}_{ts}_{os.path.basename(raw_filename)}"
                save_path = os.path.join(UPLOADS_DIR, safe_name)

                if "," in file_content and "base64" in file_content:
                    _, b64data = file_content.split(",", 1)
                    binary = base64.b64decode(b64data)
                    with open(save_path, "wb") as f:
                        f.write(binary)
                    file_size = len(binary)
                else:
                    text_bytes = file_content.encode("utf-8")
                    with open(save_path, "wb") as f:
                        f.write(text_bytes)
                    file_size = len(text_bytes)

                rel_path = f"uploads/{safe_name}"
                out_id = database.add_experiment_output(
                    exp_id=exp_id,
                    file_name=raw_filename,
                    storage_path=rel_path,
                    content_type=content_type,
                    file_size=file_size
                )

                # Mark experiment completed if output uploaded
                database.record_experiment_run(
                    exp_id=exp_id,
                    status="Completed",
                    duration_ms=0,
                    stdout=f"Output artifact saved: {raw_filename} ({file_size} bytes)",
                    stderr="",
                    exit_code=0
                )

                stats = database.get_stats()
                self._send_json(200, {
                    "success": True,
                    "output_id": out_id,
                    "storage_path": rel_path,
                    "file_name": raw_filename,
                    "file_size": file_size,
                    "message": "Output artifact stored successfully.",
                    "stats": stats
                })
            except Exception as e:
                self._send_json(500, {"success": False, "error": str(e)})
            return

        # 5. Local Safe Execution Fallback (if browser Pyodide requests or needs server execution)
        elif path == "/api/execute":
            try:
                data = self._read_json_body()
                exp_id = int(data.get("exp_id", 1))
                code = data.get("code")
                if not code:
                    exp = database.get_experiment(exp_id)
                    code = exp.get("starter_code", "") if exp else ""

                import subprocess, time
                t0 = time.perf_counter()
                exec_env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
                proc = subprocess.run(
                    [sys.executable, "-c", code],
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=15,
                    cwd=BASE_DIR,
                    env=exec_env
                )
                duration_ms = round((time.perf_counter() - t0) * 1000)
                stdout = proc.stdout
                stderr = proc.stderr
                exit_code = proc.returncode

                status = "Completed" if exit_code == 0 else "Failed"
                if exp_id > 0:
                    database.record_experiment_run(
                        exp_id=exp_id,
                        status=status,
                        duration_ms=duration_ms,
                        stdout=stdout,
                        stderr=stderr,
                        exit_code=exit_code
                    )
                stats = database.get_stats()
                self._send_json(200, {
                    "success": True,
                    "exit_code": exit_code,
                    "output": stdout,
                    "stderr": stderr,
                    "duration_ms": duration_ms,
                    "status": status,
                    "stats": stats
                })
            except subprocess.TimeoutExpired:
                if exp_id > 0:
                    database.record_experiment_run(
                        exp_id=exp_id,
                        status="Failed",
                        duration_ms=15000,
                        stdout="",
                        stderr="Execution timed out (15 second safety limit exceeded).",
                        exit_code=-1
                    )
                self._send_json(200, {
                    "success": False,
                    "exit_code": -1,
                    "output": "",
                    "stderr": "Execution timed out (15 second limit exceeded).",
                    "duration_ms": 15000,
                    "status": "Failed"
                })
            except Exception as e:
                self._send_json(500, {
                    "success": False,
                    "exit_code": -1,
                    "output": "",
                    "stderr": str(e),
                    "duration_ms": 0,
                    "status": "Failed"
                })
            return

        self._send_json(404, {"success": False, "error": f"Endpoint '{path}' not found"})

def run_server(port=PORT):
    server_address = (HOST, port)
    try:
        httpd = HTTPServer(server_address, DSlabPortalHandler)
        print(f"==================================================")
        print(f" DATA SCIENCE DIGITAL LIBRARY - Portal Server")
        print(f" Running at: http://{HOST}:{port}")
        print(f" Directory:  {BASE_DIR}")
        print(f" SQLite DB:  {database.DB_PATH}")
        print(f" Theme:      MIDNIGHT INDIGO")
        print(f"==================================================")
        httpd.serve_forever()
    except OSError as e:
        if port < PORT + 10:
            print(f"Port {port} in use, trying {port+1}...")
            run_server(port + 1)
        else:
            raise e

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port_arg)

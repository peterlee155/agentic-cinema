"r""Media Generation Execution Engine for Agentic Cinema."""

import os
import time
import uuid
import logging
import threading
import subprocess
from typing import Dict, Any, Optional
import cv2

from core.model_registry import model_registry

logger = logging.getLogger('GenerationEngine')

class GenerationEngine:
    def __init__(self):
        self.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.output_dir = os.path.join(self.root_dir, 'static', 'generated')
        os.makedirs(self.output_dir, exist_ok=True)
        self.jobs: Dict[str, Dict[str, Any]] = {}
        self.jobs_lock = threading.Lock()

    def _get_vertex_client(self, location: str = 'global'):
        from google import genai
        use_vertex = os.getenv('USE_VERTEX_AI', 'false').lower() == 'true'
        google_project = os.getenv('GOOGLE_CLOUD_PROJECT', 'seismic-relic-447818-r2')
        google_location = os.getenv('GOOGLE_CLOUD_LOCATION', location)
        api_key = os.getenv('GEMINI_API_KEY', '')

        if use_vertex and google_project:
            try:
                return genai.Client(vertexai=True, project=google_project, location=google_location)
            except Exception:
                if api_key:
                    return genai.Client(api_key=api_key)
        if api_key:
            return genai.Client(api_key=api_key)
        raise ValueError('No valid Google Cloud Vertex AI project or Gemini API key configured.')

    def generate_image(self, prompt: str, aspect_ratio: str = '16:9',
                       model: str = 'gemini-3.1-flash-image',
                       project_id: Optional[str] = None,
                       scene_num: Optional[int] = None,
                       frame_num: Optional[int] = None) -> Dict[str, Any]:
        job_id = f"img_{uuid.uuid4().hex[:10]}"
        logger.info(f"[{job_id}] Executing REAL image generation with model {model}...")

        clean_prompt = prompt
        if 'Cinematic' not in prompt and '8k' not in prompt:
            clean_prompt = f'Cinematic 35mm film still, {prompt}, 8k photorealistic, volumetric lighting, Arri Alexa LF'

        try:
            client = self._get_vertex_client(location='global')
            response = client.models.generate_content(
                model=model,
                contents=clean_prompt
            )

            image_bytes = None
            if hasattr(response, 'candidates') and response.candidates:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data and part.inline_data.data:
                        image_bytes = part.inline_data.data
                        break

            if not image_bytes:
                declined_text = response.text if hasattr(response, 'text') else 'No image bytes in response'
                logger.warning(f'[{job_id}] Model returned text instead of image bytes: {declined_text[:120]}')
                return {
                    'success': False,
                    'status': 'FAILED',
                    'error': f'Model returned text instead of raw image bytes: {declined_text[:150]}. (Google Vertex AI text models require Imagen 3 for native visual output)',
                    'job_id': job_id,
                    'model': model
                }

            filename = f"gen_img_{uuid.uuid4().hex[:8]}_{int(time.time())}.jpg"
            filepath = os.path.join(self.output_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(image_bytes)

            file_size = len(image_bytes)
            relative_url = f'/static/generated/{filename}'
            logger.info(f'[{job_id}] Image generated successfully: {relative_url} ({file_size} bytes)')

            return {
                'success': True,
                'status': 'COMPLETE',
                'job_id': job_id,
                'url': relative_url,
                'filePath': filepath,
                'fileSize': file_size,
                'aspectRatio': aspect_ratio,
                'model': model,
                'provider': 'Google Cloud Vertex AI',
                'prompt': clean_prompt,
                'projectId': project_id,
                'scene': scene_num,
                'frame': frame_num,
                'timestamp': time.time()
            }

        except Exception as e:
            logger.error(f'[{job_id}] Real image generation failed: {e}')
            return {
                'success': False,
                'status': 'FAILED',
                'job_id': job_id,
                'error': str(e),
                'model': model
            }

    def start_video_generation(self, prompt: str, image_url: Optional[str] = None,
                               aspect_ratio: str = '16:9', duration_sec: int = 4,
                               model: str = 'cinematic-motion-v1',
                               project_id: Optional[str] = None,
                               scene_num: Optional[int] = None,
                               frame_num: Optional[int] = None) -> Dict[str, Any]:
        job_id = f'vid_{uuid.uuid4().hex[:10]}'
        job_data = {
            'job_id': job_id,
            'status': 'PENDING',
            'progress': 0.05,
            'prompt': prompt,
            'image_url': image_url,
            'aspect_ratio': aspect_ratio,
            'duration': duration_sec,
            'model': model,
            'project_id': project_id,
            'scene': scene_num,
            'frame': frame_num,
            'started_at': time.time(),
            'video_url': None,
            'provider': 'Cinematic Motion Synthesizer (OpenCV + FFmpeg 24fps)',
            'error': None
        }

        with self.jobs_lock:
            self.jobs[job_id] = job_data

        thread = threading.Thread(target=self._run_video_worker, args=(job_id,), daemon=True)
        thread.start()

        return {'job_id': job_id, 'status': 'PENDING', 'message': 'Cinematic 24fps motion synthesis initiated in background'}

    def _run_video_worker(self, job_id: str):
        with self.jobs_lock:
            job = self.jobs.get(job_id)
            if not job:
                return
            job['status'] = 'RUNNING'
            job['progress'] = 0.20

        prompt = job['prompt']
        image_url = job.get('image_url')
        aspect_ratio = job.get('aspect_ratio', '16:9')
        duration = job.get('duration', 4)
        fps = 24
        total_frames = fps * duration


        try:
            source_img_path = None
            if image_url:
                clean_url = image_url.lstrip('/').replace('/', os.sep)
                candidate_path = os.path.join(self.root_dir, clean_url)
                if os.path.exists(candidate_path):
                    source_img_path = candidate_path

            if not source_img_path:
                with self.jobs_lock:
                    job['progress'] = 0.35
                img_res = self.generate_image(
                    prompt=prompt,
                    aspect_ratio=aspect_ratio,
                    model='gemini-3.1-flash-image',
                    project_id=job.get('project_id'),
                    scene_num=job.get('scene'),
                    frame_num=job.get('frame')
                )
                if not img_res.get('success'):
                    raise RuntimeError(f"Could not generate source keyframe: {img_res.get('error')}")
                source_img_path = img_res['filePath']

            with self.jobs_lock:
                job['progress'] = 0.60

            img = cv2.imread(source_img_path)
            if img is None:
                raise RuntimeError(f"Failed to read image at {source_img_path}")

            is_vertical = aspect_ratio == "9:16"
            target_w, target_h = (720, 1280) if is_vertical else (1280, 720)
            img = cv2.resize(img, (target_w, target_h))

            raw_filename = f"raw_{job_id}.avi"
            raw_path = os.path.join(self.output_dir, raw_filename)
            mp4_filename = f"gen_{job_id}.mp4"
            mp4_path = os.path.join(self.output_dir, mp4_filename)

            fourcc = cv2.VideoWriter_fourcc(*'MJPG')
            out = cv2.VideoWriter(raw_path, fourcc, fps, (target_w, target_h))

            for i in range(total_frames):
                p = i / total_frames
                scale = 1.0 + (0.12 * p)
                nh, nw = int(target_h * scale), int(target_w * scale)
                resized = cv2.resize(img, (nw, nh))

                dy = (nh - target_h) // 2
                dx = int((nw - target_w) * 0.4 + p * (nw - target_w) * 0.2)
                frame = resized[dy:dy+target_h, dx:dx+target_w]
                out.write(frame)

                if i % 10 == 0:
                    with self.jobs_lock:
                        job['progress'] = 0.60 + (0.25 * (i / total_frames))

            out.release()

            with self.jobs_lock:
                job['progress'] = 0.90

            ffmpeg_cmd = f'ffmpeg -y -i "{raw_path}" -c:v libx264 -pix_fmt yuv420p "{mp4_path}"'
            result = subprocess.run(ffmpeg_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            if os.path.exists(raw_path):
                os.remove(raw_path)

            if not os.path.exists(mp4_path) or os.path.getsize(mp4_path) < 1000:
                stderr = result.stderr.decode('utf-8', errors='ignore')
                raise RuntimeError(f'FFmpeg encoding failed: {stderr[:200]}')

            file_size = os.path.getsize(mp4_path)
            video_url = f'/static/generated/{mp4_filename}'

            with self.jobs_lock:
                job['status'] = 'COMPLETE'
                job['progress'] = 1.0
                job['video_url'] = video_url
                job['file_size'] = file_size
                job['completed_at'] = time.time()

            logger.info(f'[{job_id}] Video generation COMPLETE: {video_url} ({file_size} bytes)')

        except Exception as e:
            logger.error(f'[{job_id}] Video generation failed: {e}')
            with self.jobs_lock:
                job['status'] = 'FAILED'
                job['error'] = str(e)
                job['completed_at'] = time.time()

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self.jobs_lock:
            return self.jobs.get(job_id)

generation_engine = GenerationEngine()

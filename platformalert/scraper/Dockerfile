FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
COPY . .
CMD ["python", "-u", "scraper.py"]

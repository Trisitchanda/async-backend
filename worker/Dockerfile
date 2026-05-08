# Multi-stage Dockerfile for Python Worker
FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.11-slim

RUN useradd -m myuser

WORKDIR /home/myuser/app

COPY --from=builder /root/.local /home/myuser/.local
COPY . .

RUN chown -R myuser:myuser /home/myuser

USER myuser

ENV PATH=/home/myuser/.local/bin:$PATH

CMD ["python", "main.py"]

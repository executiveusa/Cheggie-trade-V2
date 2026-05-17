FROM python:3.12-slim
WORKDIR /app
COPY services/hermes/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY core/trading-agents /app/core/trading-agents
RUN cd /app/core/trading-agents && pip install --no-cache-dir -e .
COPY services/hermes /app/services/hermes
WORKDIR /app/services/hermes
CMD ["python", "main.py"]

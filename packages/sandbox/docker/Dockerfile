FROM node:20-slim

# Install pnpm globally
RUN npm install -g pnpm

# Set pnpm store directory for caching
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Create workspace directory
WORKDIR /workspace

COPY package.json ./

RUN pnpm install

CMD ["tail", "-f", "/dev/null"]


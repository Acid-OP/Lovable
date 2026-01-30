FROM node:20-slim

# Install pnpm globally
RUN npm install -g pnpm

# Set pnpm store directory for caching
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Create workspace directory
WORKDIR /workspace

COPY package.json ./
COPY next.config.js ./

RUN pnpm install

# Copy shadcn components into the image
COPY components /workspace/components
COPY lib /workspace/lib

CMD ["tail", "-f", "/dev/null"]


# Start from the existing base image
FROM giswqs/segment-geospatial:latest

# Switch to root user if the base image uses non-root user by default
USER root

# Install the required dependency
RUN apt-get update && apt-get install -y libglib2.0-0 && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install libgl1-mesa-glx libopencv-dev -y

# Switch back to the original user if needed 
# (the base image might have used a specific user for security)
# USER <original_user_id>

# Copy your project files into the container if necessary
# COPY . /app

# Set the working directory
WORKDIR /app

# Install Python dependencies (optional if you want to do it here rather than in docker-compose)
# RUN pip install -r requirements.txt

# By default, do nothing (or you can set a default command)
CMD ["/bin/bash"]
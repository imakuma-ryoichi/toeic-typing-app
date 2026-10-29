# 1
Glad to hear you got it sorted out! Running the tool with root privileges (sudo) or adjusting the directory ownership was exactly what it needed.
When a tool requires root authority to canonicalize a path, it is usually because it needs to traverse system-protected directories, access restricted configuration folders, or manage low-level system symlinks that standard users don't have permission to read.
Now that you have it running, are you hitting any other setup roadblocks, or do you need help configuring user-level permissions so you don't have to use sudo every time?

# 2

error: Failed to add dependencies
  cause: No solution found when resolving dependencies
  cause: Because purealsense2 was not found in the package registry and your project depends on purealsense2, we can conclude that your project's requirements are unsatisfiable.

hint: If you want to add the package regardless of the failed resolution, provide the `--frozen` flag to skip locking and syncing

The package registry cannot find your package because the library is misspelled as purealsense2. The correct name for the official Intel RealSense Python wrapper on PyPI is pyrealsense2

# 3

Since you want to use the Intel RealSense T265 Tracking Camera, you are facing two major compatibility walls that are throwing this ModuleNotFoundError:
1. The Python Version Issue: The uv add pyrealsense2 command executed in less than a millisecond because uv didn't actually download a package. For Linux platforms, Intel only provides pre-built pyrealsense2 binary wheels for Python 3.7 up to 3.11. If uv is running Python 3.12 or 3.13, it creates an empty dummy metadata resolution or fails completely, leaving your environment with nothing to import.
2. The T265 Lifecycle Issue: The T265 tracking camera relies on specific firmware and features (like wheel odometry and internal fisheye calibration) that were frozen in older versions of the SDK.
To get the T265 working flawlessly, you must pin your environment to Python 3.11.

The Solution: Force Python 3.11

Follow these exact steps from your /workspace/sandbox/py directory to clear out the broken 3.12+ environment and build a working Python 3.11 setup:

# 4

Excellent decision. Downgrading to Python 3.11 is the most reliable way to make pyrealsense2 work, as Intel's pre-built binary wheels directly support Python 3.11, avoiding the need to compile everything manually from source.
Since you are modifying the virtual environment setup, make sure you perform these steps without using sudo, while inside your project's root folder (/workspace/sandbox/py):

# 5

If you have killed all the Python processes and rm -rf .venv still throws a "Device or resource busy" error inside a Docker container, it means .venv is being used as an active storage mount point by Docker.
Linux will absolutely block you from deleting a directory if Docker is actively bind-mounting a volume or a host folder directly into it. You cannot fix this from inside the running container.
Here are the two ways to handle it:

The Quick Bypass (Move it out of the way)

If you just want to get your work done immediately without restarting your Docker layout, rename the locked folder so uv can build a fresh environment next to it:
bash
# Rename the locked mount out of the way
sudo mv .venv .venv_broken

# Proceed with your fixed clean setup
uv python pin 3.11
uv add pyrealsense2
Use code with caution.

The Clean Fix (Unmount from the Host machine)

To permanently wipe the directory, you must step outside your Docker container terminal back into your host terminal:
1. Check your configuration: Look at your docker-compose.yml or your docker run setup. You likely have a configuration rule mounting into or near your virtual environment.
2. Stop the container framework:bash
# From your Host terminal (outside the container):
docker compose down
# OR if running a standalone container:
docker stop <container_name>
Use code with caution.
3. Delete it safely from the Host: Once the container engine drops the filesystem handles, clear it out safely from your standard computer terminal:bash
rm -rf /workspace/sandbox/py/.venv
Use code with caution.
4. Boot back up: Spin your container environment back up, jump inside, and safely run uv python pin 3.11 && uv add pyrealsense2 without interference.
Did renaming the folder allow you to bypass the lock and keep moving, or do you need help editing your Docker Volume configurations to prevent this from locking up in the future?

# 6


sudo mv .venv .venv.bak
mv: cannot move '.venv' to '.venv.bak': Device or resource busy
Maybe would be better to just exit Docker and edit it from the outside?

Yes, exiting Docker and deleting it from the host machine is absolutely your best move here.
When mv fails with Device or resource busy, it confirms that .venv is being used as a direct mount point in your Docker configuration (e.g., a volume or bind-mount). Linux will not allow you to delete or rename a directory while it is actively acting as a mount gateway.

Your Action Plan

1. Exit the container:bash
exit
Use code with caution.
2. Stop the container (from your host terminal):
If Docker is actively running, it keeps the mount locked. Stop it first:bash
docker stop <your_container_name>
# OR if using docker-compose:
docker compose down
Use code with caution.
3. Delete the folder from the host:
Now that the container is down, the mount lock is broken. Clear it safely:bash
rm -rf /workspace/sandbox/py/.venv
Use code with caution.
4. Restart and run without root:
Start your container back up, hop inside, and initialize your environment cleanly as a normal user:bash
uv python pin 3.11
uv add pyrealsense2
uv run src/main.py
Use code with caution.
Once you are back inside the fresh container, let me know if uv add installs smoothly without hitting any more permission errors!


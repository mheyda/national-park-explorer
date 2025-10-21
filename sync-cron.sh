cd /home/app/web
while true; do
  start_time=$(date +%s)
  echo "Running sync_parks management command at $(date)"
  /usr/local/bin/python manage.py sync_parks
  end_time=$(date +%s)

  # Calculate elapsed time
  elapsed=$((end_time - start_time))

  # One week in seconds
  interval=604800

  # Calculate how much to sleep so the interval stays fixed
  sleep_time=$((interval - elapsed))

  # If command took longer than interval, don't sleep
  if [ $sleep_time -le 0 ]; then
    sleep_time=0
  fi

  echo "Sleeping for $sleep_time seconds"
  sleep $sleep_time
done
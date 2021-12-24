# speedtest

very simple tool to do speedtest every houry with random offset

## basic idea
the idea is to install this tool on a linux machine, conntected to internet router via ethernet and check every hour (with random offset in minutes) to check if internet connection provides contractually agreed speed.

the tool uses the speedtest package (https://github.com/sivel/speedtest-cli) and it's json output. 

## installation

1. install speedtest (aptitude install speedtest)
2. copy cron.hourly/speedtest.cron.houly.template to /etc/cron.hourly/speedtest
3. make speedtest script executable: chmod 755 /etc/cron.hourly/speedtest
4. adjust path and flags in /etc/cron.hourly/speedtest
5. copy .env_example to .env and customize to your needs


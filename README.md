# speedtest

very simple tool to do speedtest every houry with random offset

## basic idea
the idea is to install this tool on a linux machine, conntected to internet router via ethernet and check every hour (with random offset in minutes) to check if internet connection provides contractually agreed speed.

the tool uses the speedtest package (https://github.com/sivel/speedtest-cli) and it's json output. 

## installation

0. git clone https://github.com/dels/speedtest (clone repository)
1. sudo aptitude install speedtest (install "speedtest")
1. sudo aptitude install node (install "node" if which node returns no file)
2. yarn install (install js dependencies)
3. sudo cp cron.hourly/speedtest.cron.houly.template  cron.hourly/speedtest
3. sudo ln -s cron.hourly/speedtest /etc/cron.hourly/speedtest

4. make speedtest script executable: chmod 755 cron.hourly/speedtest
4. make speedtest.js script executable: chmod 755 speedtest.js
4. make analyzer.js script executable: chmod 755 analyzer.js
5. adjust path and flags in /etc/cron.hourly/speedtest
   - all download and upload flags
   - logfile
   - path to installaion (--home)
   - OPTIONAL: customize --log-level and --log-file
6. copy .env_example to .env and customize to your needs


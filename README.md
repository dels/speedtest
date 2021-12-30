# speedtest

tool to do speedtest every houry with random offset in order to check the quality of you connection

## basic idea
the idea is to install this tool on a linux machine, conntected to internet router via ethernet and check every hour (with random offset in minutes) to check if internet connection provides contractually agreed speed.

the tool uses the speedtest package (https://github.com/sivel/speedtest-cli) and it's json output. 

## pre-conditions

the speedtest is supposed to be done every hour with execptions given by the german Bundesnetzagentur.

to comply with the requirements, you must have a machine that is cable connected to you router provided by your isp. 

i recommend that you pre-check your network connection of the measuring host. you can use iperf3 or similiar to check if your host can provide the internet bandwidth with their network card (e.g. pi in first version is not able to provide ethernet faster than a few mbits).

## installation

0. git clone https://github.com/dels/speedtest (clone repository)
1. sudo aptitude install speedtest (install "speedtest")
2. sudo aptitude install node (install "node" if which node returns no file)
3. yarn install (install js dependencies)
4. sudo cp cron.hourly/speedtest.cron.houly.template  cron.hourly/speedtest
5. sudo ln -s cron.hourly/speedtest /etc/cron.hourly/speedtest
6. make speedtest script executable: chmod 755 cron.hourly/speedtest
7. make speedtest.js script executable: chmod 755 speedtest.js
8. make analyzer.js script executable: chmod 755 analyzer.js
9. adjust path and flags in /etc/cron.hourly/speedtest
   - all download and upload flags
   - logfile
   - path to installaion (--home)
   - OPTIONAL: customize --log-level and --log-file
   - (basically script will tell you what is missing or wrong)

## interpretation of results

the analyzer.js can be used with same parameters as speedtest.js. It will give you a list of statistics on you measure results.


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
1. sudo aptitude install speedtest-cli (install "speedtest")
2. sudo aptitude install npm (install "node" if which node returns no file)
3. sudo npm install --global yarn
   -- if this warns you because of outdated node package or if you experience any versioning issue on the further way, the following commands helped be to solve:
   - npm cache clean -f
   - npm install -g n
   - n stable
4. yarn install (install js dependencies)
5. sudo cp cron.hourly/speedtest.cron.houly.template  /etc/cron.hourly/speedtest
7. chmod 755 /etc/cron.hourly/speedtest (make speedtest script executable)
8. chmod 755 speedtest.js (make speedtest.js script executable)
9. chmod 755 analyzer.js (make analyzer.js script executable) 
10. adjust path and flags in /etc/cron.hourly/speedtest
   - all download and upload flags
   - logfile
   - path to installaion (--home)
   - OPTIONAL: customize --log-level and --log-file
   - (basically script will tell you what is missing or wrong)

all commands together - only customize user that is supposed to run analytics

aptitude install speedtest-cli npm &&  npm install --global yarn &&  npm cache clean -f && npm install -g n &&  n stable && \
 cp cron.hourly/speedtest.cron.houly.template  /etc/cron.hourly/speedtest \
 chmod 755 /etc/cron.hourly/speedtest && chmod 755 speedtest.js && chmod 755 analyzer.js && $EDITOR /etc/cron.hourly/speedtest \
su <your user> && yarn install

## interpretation of results

the analyzer.js can be used with same parameters as speedtest.js. It will give you a list of statistics on you measure results.

## TODO

- run speedtest as user not as root - user must be configureable in cron.hourly/speedtest.cron.hourly.template
- provide more statistics
  - in percent, how many days we missed the minimum download
  - in percent, days we didnt reach 90 percent at least once
  - in percent, how many days did we had a perfect connection not failing in one of the three tests BNetzA requirements



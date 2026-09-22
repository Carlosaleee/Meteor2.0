const Cron = () => () => {};
const CronExpression = {
  EVERY_6_HOURS: '0 */6 * * *',
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
};

module.exports = { Cron, CronExpression };

export default () => ({
  environment: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT || 3306,
  },
});
export const EMAIL_AUTH_USER = '3491357178@qq.com';
export const EMAIL_AUTH_PASS = 'xmnngyfxkkumcihf';
export const EMAIL_AUTH_USERNAME =
  '四川轻化工大学计算机技术协会 <3491357178@qq.com>';

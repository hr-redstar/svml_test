const path = require("path");

module.exports = {
  apps: [
    {
      name: "svml_zimu_bot",
      script: "index.js",
      env: {
        GOOGLE_APPLICATION_CREDENTIALS: "/home/star_vesta_legion_kanri/data/svml_key.json",
        NODE_ENV: "production",
      },
      error_file: path.resolve(__dirname, "logs/error.log"),
      out_file: path.resolve(__dirname, "logs/out.log"),
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
    }
  ]
};

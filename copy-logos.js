const fs = require('fs');
try {
  fs.cpSync('d:/01_WEB/01_Projects/jannahflow/src/app/logo', 'd:/01_WEB/01_Projects/jannahflow-compro/logo', {recursive: true});
  fs.cpSync('d:/01_WEB/01_Projects/jannahflow/src/app/logo', 'd:/01_WEB/01_Projects/jannahflow-landing/logo', {recursive: true});
  fs.cpSync('d:/01_WEB/01_Projects/jannahflow/src/app/logo', 'd:/01_WEB/01_Projects/jannahflow-license/logo', {recursive: true});
  console.log("Success");
  process.exit(0);
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}

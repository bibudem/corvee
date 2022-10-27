import semver from 'semver'
import pkg from '../package.json' assert { type: 'json'}

const version = pkg.engines.node;
if (!semver.satisfies(process.version, version)) {
  console.error(`\x1b[1;31mWARNING\x1b[0;37m: ${pkg.name} package requires node version ${version}. The current version is ${process.version}.`);
  process.exit(1);
}
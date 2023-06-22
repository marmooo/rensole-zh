rm remote.db
rm -rf docs/db
mv cc.zh.300-small.magnitude remote.db
bash optimize.sh
mkdir -p docs/db
bash create_db.sh remote.db docs/db

# Magalu Cloud - comandos úteis (resumo)
# Login e tenant
mgc auth login
mgc auth tenant list
mgc auth tenant set --tenant.id=<TENANT_ID>

# DBaaS (Postgres)
mgc dbaas engines list
mgc dbaas instance-types list
mgc dbaas instances create --name "duo-db" --engine-id <PG_ENGINE> --instance-type-id <TYPE> --user duo --password <PWD> --availability-zone br-se1-a --volume.size 20
mgc dbaas instances get --instance-id <ID>

# Object Storage (S3)
mgc object-storage api-key create hackathon-key
mgc object-storage buckets create duo-assets
mgc object-storage objects upload ./assets/badge1.png duo-assets
mgc object-storage objects public-url --dst "duo-assets/badge1.png"

# VM API
mgc virtual-machine machine-types list --availability-zone br-se1-a
mgc virtual-machine instances create --image.name "ubuntu-22.04" --machine-type.name "cloud.gp1.small" --network.associate-public-ip=true --name "duo-api"

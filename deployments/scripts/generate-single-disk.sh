#!/bin/sh

# Check for diskspace argument
if [[ $# -eq 0 ]] ; then
    echo 'You must provide one argument for the size of the persistent drive'
    echo '  Usage: generate-single-disk.sh 50 3'
    echo ' this will create a 50Gi disk named ps-ssd-disk-3'
    echo
    exit 1
fi

# Register GCE Fast SSD persistent disks and then create the persistent disks 
echo "Creating GCE disks"
gcloud compute disks create --size ${1}GB --type pd-ssd pd-ssd-disk-${2}
sleep 3

# Create persistent volumes using disks created above
echo "Creating GKE Persistent Volumes"
sed -e "s/INST/${2}/g" ../resources/xfs-gce-ssd-persistentvolume.yaml > /tmp/xfs-gce-ssd-persistentvolume-temp.yaml
sed -e "s/SIZE/${1}/g" /tmp/xfs-gce-ssd-persistentvolume-temp.yaml > /tmp/xfs-gce-ssd-persistentvolume.yaml
cat /tmp/xfs-gce-ssd-persistentvolume.yaml
kubectl apply -f /tmp/xfs-gce-ssd-persistentvolume.yaml
rm /tmp/xfs-gce-ssd-persistentvolume.yaml
sleep 3
# Print current deployment state
kubectl get persistentvolumes
echo
kubectl get all 


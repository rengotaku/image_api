#!/bin/sh

####################
# about
####################
# GCPに指定したファイルをアップロードする

####################
# base setting
####################
# シェルパス
SCRIPT_DIR=$(cd $(dirname $0); pwd)

####################
# usage
####################
cmdname=`basename $0`
function usage()
{
  echo "Usage: ${cmdname} FILE_PATH"
  echo "  This script is ~."
  echo "FILE_PATH:"
  echo "  Full path of file."
  exit 1
}

####################
# Parameter check
####################
if [ "$1" = "" ]; then
  usage
  exit 1
fi

fullfile=$1
shift

# declare -i argc=0
# declare -a argv=()
# while (( $# > 0 ))
# do
#     case "$1" in
#         -*)
#             if [[ "$1" =~ '--init' ]]; then
#                 i_flag='TRUE'
#             fi
#             shift
#             ;;
#         # *)
#         #     ((++argc))
#         #     argv=("${argv[@]}" "$1")
#         #     shift
#         #     ;;
#     esac
# done

####################
# Variables
####################
GCP_BACKET=gs://$GCLOUD_STORAGE_BUCKET/image/
GCP_KEY_FILE=$WORK_DIR/config/gcp/service-account.json

dirsname=$(dirname $fullfile)
filename=$(basename -- "$fullfile")
extension="${filename##*.}"
filename="${filename%.*}"
today=`date "+%Y%m%d"`
upload_file="/var/tmp/${filename}_${today}.${extension}"

####################
# Functions
####################


####################
# Main
####################
echo "== Start upload! =="

cp $fullfile $upload_file

echo "Uploading $upload_file ..."

gcloud auth activate-service-account $GCLOUD_STORAGE_SERVICE_ACCOUNT --key-file $GCP_KEY_FILE --project $GCLOUD_STORAGE_PROJECT_ID

gsutil cp $upload_file $GCP_BACKET

ret=$?
if [ $ret -ne 0 ]; then
  echo "Failed uploaded file to GCP."
  exit 1
fi

echo "== End upload with success! =="
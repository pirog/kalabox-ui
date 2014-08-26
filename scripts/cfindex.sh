 #!/bin/bash

[[ -n "$3" ]] || { echo "Usage: $0 username apikey container"; exit 0 ; }

ENDPOINT='lon.identity.api.rackspacecloud.com'

AUTH='{ "auth": { "RAX-KSKEY:apiKeyCredentials": { "username": "'${1}'", "apiKey": "'${2}'" } } }'

TOKENS=`echo ${AUTH} | http POST https://${ENDPOINT}/v2.0/tokens`

AUTHTOKEN=`echo ${TOKENS} | jq -r '.access.token.id'`
PUBLICURL=`echo ${TOKENS} | jq -r '.access.serviceCatalog[] | select(.name == "cloudFiles").endpoints[] | select(.region == "ORD").publicURL'`

HTML="<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n"
HTML+="<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" lang=\"en\">\n"
HTML+="\t<head>\n"
HTML+="\t\t<meta http-equiv=\"Content-Type\" content=\"text/html;charset=utf-8\" />\n"
HTML+="\t\t<title>Kalabox2 Development Builds</title>\n"
HTML+="\t\t<link href=\"//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css\" rel=\"stylesheet\">\n"
HTML+="\t\t<script src=\"//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js\"></script>\n"
HTML+="\t</head>\n"
HTML+="\t<body>\n"
HTML+="\t\t<img src=\"https://camo.githubusercontent.com/a2c89a5279aa7c68a35c5010bf26ef37f4e762a1/687474703a2f2f7777772e6b616c616d756e612e636f6d2f73697465732f64656661756c742f66696c65732f66656174757265645f636f6e74656e742f696d616765732f63656c6562726174652532306b322e706e67\">"
HTML+="\t\t<table class=\"table table-striped\">\n"
HTML+="\t\t\t<tr><th>Name</th><th>Content-type</th><th>Bytes</th><th>Last modified</th></tr>\n"

while read line
do
    echo ${line}
    content_type=`echo ${line} | jq -r .content_type`
    name=`echo ${line} | jq -r .name`
    bytes=`echo ${line} | jq -r .bytes`
    last_modified=`echo ${line} | jq -r .last_modified`
    if [ ${name} != "index.html" ]
        then
            HTML+="\t\t\t<tr><td><a href=\"${name}\">${name}</a></td><td>${content_type}</td><td>${bytes}</td><td>${last_modified}</td></tr>\n"
    fi
done < <( http GET ${PUBLICURL}/${3}?format=json X-Auth-Token:${AUTHTOKEN} | jq -c .[] )

HTML+="\t\t</table>\n"
HTML+="\t\t<div><br /><i>Generated on `date`</i></div>\n"
HTML+="\t</body>\n"
HTML+="</html>"

http DELETE ${PUBLICURL}/${3}/index.html X-Auth-Token:${AUTHTOKEN}
echo -e ${HTML} | http PUT ${PUBLICURL}/${3}/index.html X-Auth-Token:${AUTHTOKEN} Content-Type:text/html
http POST ${PUBLICURL}/${3} X-Auth-Token:${AUTHTOKEN} X-Container-Meta-Web-Index:index.html

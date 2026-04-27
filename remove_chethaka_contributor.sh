# Safe Authorship Remapping Script
# This script reassigns all commits from "chethaka" to the main account "Ranahasuni"
# to remove the "fake" entry from GitHub Contributors Insights.

git filter-branch --force --env-filter '
OLD_EMAIL1="chethaka.d.396@gmail.com"
OLD_EMAIL2="chethaka@users.noreply.github.com"
CORRECT_NAME="Ranahasuni"
CORRECT_EMAIL="pererachathurya05@gmail.com"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL1" ] || [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL2" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL1" ] || [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL2" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags

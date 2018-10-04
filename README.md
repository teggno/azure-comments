Kommentar-system
* Azure functions fuer
    * Abrufen der Kommentare eines posts
    * Abrufen der Kommentare admin
    * Speichern
* Daten speichern in Azure Table Storage
* Kommentare periodisch in Post Markdown rendern
* Google recaptcha
* Authentication: keine

## Flow
Add: Blog JS -> Function NewComment (Nach ReCaptcha Binding1: Table, Binding2: Queue1 for Text Analysis)
Queue1 -> Function(Binding1: Queue1) -> Text Analysis -> good: Queue2, bad: Queue3
Queue2 -> Function Update Table set visibility flag
Queue3 -> Send mail with link for moderation

## Data Structures
Comment
* Timestamp (UTC)
* RowKey
* PartitionKey (= post url)
* text
* authorName
* replyToRowKey


## Functions
* Add a comment
* Delete a comment
* Get all comments for one post
* Get all comments added within a period of time (for moderation)

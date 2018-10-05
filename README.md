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

## Need for moderation
Recaptcha return r, Sentiment return s

1. Check recaptcha, store result in comment entity
2. If recaptcha failed, ignore the comment, don't do anything more with it.
3. If recaptcha successful && < some limit lr -> moderate
4. If recaptcha successful && >= lr -> do sentiment, sentiment result in comment entity
5. If sentiment < some limit ls -> moderate
6. If sentiment >= ls, do keyword extraction
7. Do keyword extraction with new posts
8. Compare comment keywords with post keywords
9. Moderate if no intersection, otherwise accept

Risk of doing it as above: As soon as a comment got through captcha, cognitive services is used which costs.


First, check sentiment. If r < limit lr then needs moderation.

Only the ones where r >= lr


Another idea would be doing keyword extraction from the post itself and from the comment too and then check if there is any intersection between the two.


So, always check recaptcha, it's free.


Add "Report this comment" button.


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

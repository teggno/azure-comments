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

## Moderation

### When to moderate
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

Another idea would be doing keyword extraction from the post itself and from the comment too and then check if there is any intersection between the two.

### Moderation implementation
Whenever a the system determines that a comment has to be moderated, a JSON object like `{"PartitionKey":"...", "RowKey": "..."}` is placed in the **moderation** queue.

#### API endpoints involved
1. An individual comment can be retrieved using a base64 encoded version of its PartitionKey/RowKey/unauthenticatedModerationToken combination. If it needs moderation, the RowKey is still secret as it hasn't been given to anyone. No Authentication is needed because it is unlikely enough that somebody can guess such a combination.
2. Only comments with `public=false` can be moderated.
3. The PUT endpoint that takes the moderation result receives the PartitionKey/RowKey/unauthenticatedModerationToken combination. No Authentication is needed because it is unlikely enough that somebody can guess such a combination.
4. The PUT endpoint updates the comment in the Comments table with the result of the moderation and, if it was accepted, sets `public=true`.

#### UI
A standalone **Moderate comment** HTML page exists that gets the base64 encoded combination as query string. This page displays the comment and provides two buttons: "Accept" and "Decline". Whenever one of those buttons is clicked, the PUT request to the API above is performed.

#### Notification
When a comment is unqueued from the **moderation** queue, an email containing a link to the aforementioned **Moderate comment** page is sent to one configured email address.

#### Necessary settings for moderation
* General Email settings
  * SMTP server name or IP
  * Notification sender email address
  * Notification sender reply to address
* Notification receipient email address
* Text for email with some placeholder for the link.







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

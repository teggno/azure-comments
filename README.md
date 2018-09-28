Kommentar-system
* Azure functions fuer 
    * Abrufen
    * Speichern
* Daten speichern in Azure Table Storage
* Kommentare periodisch in Post Markdown rendern
* Spam detection?
* Authentication?

## Flow
Blog JS -> Queue -> Function (Binding ->Table)

## Data Structures
Comment
* ID
* Text
* Author
* CommentedPostRef
* DateTimeUtc
* ReplyToOtherComment


## Functions
* Add a comment
* Delete a comment
* Get all comments for one post
* Get all comments added within a period of time (for moderation)

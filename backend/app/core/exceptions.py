class DasaikoException(Exception):
    pass


class DocumentNotFoundException(DasaikoException):
    pass

class ConversationNotFoundException(DasaikoException):
    pass
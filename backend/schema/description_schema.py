from marshmallow import Schema, fields, validate, ValidationError
import re

class DescriptionRequestSchema(Schema):
    title = fields.Str(
        required=True, 
        validate=[
            validate.Length(min=1, max=200, error="Title must be between 1 and 200 characters"),
            validate.Regexp(r'^[a-zA-Z0-9\s\-_.,!?()]+$', error="Title contains invalid characters")
        ]
    )
    features = fields.Str(
        required=True,
        validate=[
            validate.Length(min=1, max=1000, error="Features must be between 1 and 1000 characters"),
            validate.Regexp(r'^[a-zA-Z0-9\s\-_.,!?()\n\r]+$', error="Features contains invalid characters")
        ]
    )
    tone = fields.Str(
        validate=validate.OneOf(
            ['professional', 'fun', 'friendly'], 
            error="Tone must be one of: professional, fun, friendly"
        )
    )
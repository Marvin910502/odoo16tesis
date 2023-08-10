from odoo import api, fields, models


class AppsUser(models.Model):
    _name = 'apps.user'
    _description = 'Apps User'

    name = fields.Char(string='Name')
    icon = fields.Char(string='icon')


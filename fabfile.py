"""Fabric commands for Heroku deployment"""
import os

from fabric.api import local

use_remote = os.environ.get('HEROKU_USE_REMOTE', '')
heroku_manager = 'heroku' if use_remote else 'foreman'
MANAGE_PY = heroku_manager + ' run python manage.py '

INITIAL_DATA = (
    # json filenames processed in this order
    # files should exist in <some_app>/fixtures/<name_below>.json
    # for <some_app> in settings.INSTALLED_APPS
)

TESTABLE_MODULES = ()


def initdata(syncdb=True):
    """Load initial fixtures into database in proper order"""
    if syncdb:
        local(MANAGE_PY + 'syncdb --noinput')
    for fixture in INITIAL_DATA:
        local(MANAGE_PY + "loaddata " + fixture + ".json")


def manage(command):
    """Run some command with MANAGE_PY"""
    local(MANAGE_PY + command)


def pep8():
    """Run pep8 {module1,module2,...,moduleN}/*.py on TESTABLE_MODULES"""
    exclude = '--exclude="*/migrations/*"'
    local('pep8 {} {{{}}}'.format(exclude, ','.join(TESTABLE_MODULES)))


def pylint():
    """Run pylint {module1,module2,...,moduleN}/*.py on TESTABLE_MODULES"""
    pylint_cmd = 'pylint {{{}}}'.format(','.join(TESTABLE_MODULES))
    # Ignore separator lines, missing module docstring warnings for
    # __init__.py, and 'locally-disabled' messages
    grep_filter = 'grep -v "locally-disabled\|__init__\.py\|\*\*\* Module"'
    local(' | '.join((pylint_cmd, grep_filter)))


def startserver():
    """Run collectstatic and start the development web server"""
    local(MANAGE_PY + 'collectstatic --noinput && foreman start')


def test(target=None):
    """Run full suite of tests with failfast"""
    if target is None:
        target = '{{{}}}'.format(','.join(TESTABLE_MODULES))
    local(MANAGE_PY + 'test --failfast ' + target)

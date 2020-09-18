import logging
import sys
import traceback

import multiprocess as mp


def parse_traceback_for_sentry(tb):
    """Parse traceback to send Sentry-compatible strings

    Sentry appears to limit each `extra` string to 500 characters. This splits
    the traceback string across N chunks of at most 500 characters each.
    Chunks are split at newlines for readability. Traceback lines over 500
    characters are still truncated.

    Parameters
    ----------
    tb : list of strings
        Traceback formatted such that each list item is a new line.
    """
    out = dict()
    out_str = ""
    counter = 0
    for i in range(len(tb)):
        out_str += tb[i][0 : min(500, len(tb[i]))]
        if i != len(tb) - 1 and len(out_str) + len(tb[i + 1]) < 500:
            continue
        out["traceback-%d" % counter] = out_str
        out_str = ""
        counter += 1
    return out


class Process(mp.Process):
    """Wrapper Process class that includes exception logging"""

    def __init__(self, *args, **kwargs):
        mp.Process.__init__(self, *args, **kwargs)
        self.logger = logging.getLogger("openwpm")

    def run(self):
        try:
            mp.Process.run(self)
        except Exception as e:
            tb = traceback.format_exception(*sys.exc_info())
            extra = parse_traceback_for_sentry(tb)
            extra["exception"] = tb[-1]
            self.logger.error("Exception in child process.", exc_info=True, extra=extra)
            raise e

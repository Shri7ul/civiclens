# Compatibility shim: expose backend.utils.* as utils.*
import pkgutil
import importlib
import sys
import backend.utils as _backend_utils

for finder, name, ispkg in pkgutil.iter_modules(_backend_utils.__path__):
    full_name = f"backend.utils.{name}"
    mod = importlib.import_module(full_name)
    sys.modules[f"utils.{name}"] = mod
    setattr(sys.modules[__name__], name, mod)

# Compatibility shim: expose backend.auth.* as auth.*
import pkgutil
import importlib
import sys
import backend.auth as _backend_auth

for finder, name, ispkg in pkgutil.iter_modules(_backend_auth.__path__):
    full_name = f"backend.auth.{name}"
    mod = importlib.import_module(full_name)
    sys.modules[f"auth.{name}"] = mod
    setattr(sys.modules[__name__], name, mod)

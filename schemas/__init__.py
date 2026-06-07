# Compatibility shim: expose backend.schemas.* as schemas.*
import pkgutil
import importlib
import sys
import backend.schemas as _backend_schemas

for finder, name, ispkg in pkgutil.iter_modules(_backend_schemas.__path__):
    full_name = f"backend.schemas.{name}"
    mod = importlib.import_module(full_name)
    sys.modules[f"schemas.{name}"] = mod
    setattr(sys.modules[__name__], name, mod)

# Compatibility shim: expose backend.models.* as models.* for existing imports
import pkgutil
import importlib
import sys
import backend.models as _backend_models

# Import and register each submodule from backend.models under models.<name>
for finder, name, ispkg in pkgutil.iter_modules(_backend_models.__path__):
    full_name = f"backend.models.{name}"
    mod = importlib.import_module(full_name)
    sys.modules[f"models.{name}"] = mod
    setattr(sys.modules[__name__], name, mod
                )

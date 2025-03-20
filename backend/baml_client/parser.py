###############################################################################
#
#  Welcome to Baml! To use this generated code, please run the following:
#
#  $ pip install baml-py
#
###############################################################################

# This file was generated by BAML: please do not edit it. Instead, edit the
# BAML files and re-generate this code.
#
# ruff: noqa: E501,F401,F821
# flake8: noqa: E501,F401,F821
# pylint: disable=unused-import,line-too-long
# fmt: off
from typing import Any, Dict, List, Optional, Union, TypedDict, Type, Literal, cast
from typing_extensions import NotRequired

import baml_py

from . import types, partial_types
from .types import Checked, Check
from .type_builder import TypeBuilder


class BamlCallOptions(TypedDict, total=False):
    tb: NotRequired[TypeBuilder]
    client_registry: NotRequired[baml_py.baml_py.ClientRegistry]


class LlmResponseParser:
    __runtime: baml_py.BamlRuntime
    __ctx_manager: baml_py.BamlCtxManager

    def __init__(self, runtime: baml_py.BamlRuntime, ctx_manager: baml_py.BamlCtxManager):
      self.__runtime = runtime
      self.__ctx_manager = ctx_manager

    
    def ExtractResume(
        self,
        llm_response: str,
        baml_options: BamlCallOptions = {},
    ) -> types.Resume:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      parsed = self.__runtime.parse_llm_response(
        "ExtractResume",
        llm_response,
        types,
        types,
        partial_types,
        False,
        self.__ctx_manager.get(),
        tb,
        __cr__,
      )

      return cast(types.Resume, parsed)
    


class LlmStreamParser:
    __runtime: baml_py.BamlRuntime
    __ctx_manager: baml_py.BamlCtxManager

    def __init__(self, runtime: baml_py.BamlRuntime, ctx_manager: baml_py.BamlCtxManager):
      self.__runtime = runtime
      self.__ctx_manager = ctx_manager

    
    def ExtractResume(
        self,
        llm_response: str,
        baml_options: BamlCallOptions = {},
    ) -> partial_types.Resume:
      __tb__ = baml_options.get("tb", None)
      if __tb__ is not None:
        tb = __tb__._tb # type: ignore (we know how to use this private attribute)
      else:
        tb = None
      __cr__ = baml_options.get("client_registry", None)

      parsed = self.__runtime.parse_llm_response(
        "ExtractResume",
        llm_response,
        types,
        types,
        partial_types,
        True,
        self.__ctx_manager.get(),
        tb,
        __cr__,
      )

      return cast(partial_types.Resume, parsed)
    


__all__ = ["LlmResponseParser", "LlmStreamParser"]
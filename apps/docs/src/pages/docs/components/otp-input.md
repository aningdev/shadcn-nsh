---
layout: ../../../layouts/Docs.astro
title: OTP Input
description: Styled OTP input wrapping nsh/base OtpInput.
component: true
demo: otp-input
---

Styled wrapper on `nsh/base`.

## Install

```sh
shadcn-nsh add otp-input
# monorepo:
shadcn-nsh add otp-input -c apps/web
```

## Usage

```tsx
import { OtpInput } from "@workspace/ui/components/ui/otp-input";

<OtpInput length={6} onComplete={(e) => console.log(e.value)} />;
```

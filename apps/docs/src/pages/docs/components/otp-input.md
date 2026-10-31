---
layout: ../../../layouts/Docs.astro
title: OTP Input
description: Styled OTP input wrapping nsh/base OtpInput.
component: true
---

Styled wrapper on `nsh/base`. Behavior and a11y: [OTP Input](https://nsh.dev/elements/otp-input).

## Install

```sh
shadcn-nsh add otp-input
# monorepo:
shadcn-nsh add otp-input -c apps/web
```

## Usage

```tsx
import { OtpInput } from "@workspace/ui/components/ui/otp-input";

<OtpInput length={6} onComplete={(e) => console.log(e.value)} />
```

## Source

Authoring: `packages/ui/otp-input.tsx`. Registry: `otp-input` (depends on `theme`).

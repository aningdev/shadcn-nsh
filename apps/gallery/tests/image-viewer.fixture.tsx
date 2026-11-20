import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { ImageViewer, type ImageViewerImage } from "../../../packages/ui/image-viewer";

const PHOTO: ImageViewerImage = {
  src: "https://example.invalid/sunrise.jpg",
  alt: "A sunrise over the pad",
};

function App() {
  const image = signal<ImageViewerImage | null>(null);
  const closes = signal(0);
  return (
    <View>
      <Text>closes {() => closes()}</Text>
      <BaseButton onPress={() => image.set(PHOTO)}>
        <Text>Open photo</Text>
      </BaseButton>
      <ImageViewer
        image={image()}
        animation="none"
        onClose={() => {
          closes.set(closes() + 1);
          image.set(null);
        }}
      />
    </View>
  );
}

mount(App);

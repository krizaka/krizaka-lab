import { type GridPhoto, PhotoGrid } from "@krizaka/ui/native";
import { useState } from "react";
import { View } from "react-native";

const png = (data: string) => `data:image/png;base64,${data}`;

// A profile's photos: the first is the main one; a tap opens its menu (main, earlier, later, remove).
export default function NativePhotoGridProfilePhotos() {
  const [photos, setPhotos] = useState<GridPhoto[]>([
    { id: "1", uri: png("iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAIAAACtAwlQAAABaklEQVR42mWMy24UQQxF7arqlwLhIbJhwZZf5I/4IISEBIsIRSKTMOmZnp7uqrJ9zYIeIeCsrqzjw+vHDwYCCM6wbfy5gABKatsysJqLuoHciZ2dGE4ApSrbnyidVn06lVyQUrweur5pmAJAqVQGSEGnRb79mD5/H6dzuRq6929fv7t5MTSd+6VUK3Zj/XQ7frkblyJ926jwkIab6yZw3Eq58rzaz6nMq1RVA+3nMmd73nMMfCkJiRBA7u5O7g6QCFfhyLyVRJg89U3bxKiGJsQ+te6pCge+lETYPT3rujalotqkNLSdexRhJk6lshjOWXeH+WE6Z1HAi+p+Pr+czuxtG0PKlZesd+P09f5xd5iKqrlX1cfpGCiqhDdXr9Ja8DSX24f9/eG4VDGAiAzIIrvpwJ6C96FUXrId15Ivxm8MKCpzKUvRUCpXJTOHO/2Nu6uhqocqLMr4V9iAkxoHMzZjgP7XnMjBZvQLMEROG5iV3IMAAAAASUVORK5CYII="), alt: "Elena at the beach" },
    { id: "2", uri: png("iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAIAAACtAwlQAAABZklEQVR42m3MzW4TUQyGYZ8zZzJpwp8UiQ0SEvfMLXETICqoKrXQdDohyZwZ258/FpPCAryyrUdv6j99ZDAiSALLFhFkULhcLAAWFEEA7ggEhYkiImQwWNx84WY+Vh0OZzVvcn657bq25MQIFlOLYCDOY/1+23/59uN0mrZX3Yf3u3dvX6+7VvhcMvXH/vT5+u7rzcM02XrVOvyqbXZvNjmlYmoMqtpY5+EwjqOae4CHX7XWWTerktOl5OYwR5AkKSSXp6sxP5fcPJHrVWlLA0Rpctc2iYQ5/5RgEHLTlbY0qt6WZrsuQrp5SlJMzRG16r4/98M4qyM4m/eH+mqzyilWTVNUfZr0bn+8vn16eDqqeZDm2A9jEgawe7Eu8zQPx+nmfrh/PNbZERQRBCf1n0NtkhQym/lU59N5nu0ilkFQDaeqddLsamZwB/+Cy5CEhzuym8M9KP8iEQkSjgwAAP9LhCQB/AYQ5Y+kAv/RXgAAAABJRU5ErkJggg=="), alt: "Elena with her guitar" },
  ]);
  return (
    <View style={{ width: 340 }}>
      <PhotoGrid
        value={photos}
        onValueChange={setPhotos}
        onAdd={() => undefined}
        required={2}
        labels={{ add: "Add a photo", main: "Main", photo: (n) => `Photo ${n}`, makeMain: "Make it the main photo", moveEarlier: "Move earlier", moveLater: "Move later", remove: "Remove", cancel: "Cancel" }}
      />
    </View>
  );
}

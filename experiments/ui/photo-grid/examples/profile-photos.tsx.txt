"use client";

import { type GridPhoto, PhotoGrid } from "@krizaka/ui/photo-grid";
import { useState } from "react";

const png = (data: string) => `data:image/png;base64,${data}`;

// A profile's photos: drag one onto another, or its buttons; the first is the main one.
export default function PhotoGridProfilePhotos() {
  const [photos, setPhotos] = useState<GridPhoto[]>([
    { id: "1", src: png("iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAIAAACtAwlQAAABaklEQVR42mWMy24UQQxF7arqlwLhIbJhwZZf5I/4IISEBIsIRSKTMOmZnp7uqrJ9zYIeIeCsrqzjw+vHDwYCCM6wbfy5gABKatsysJqLuoHciZ2dGE4ApSrbnyidVn06lVyQUrweur5pmAJAqVQGSEGnRb79mD5/H6dzuRq6929fv7t5MTSd+6VUK3Zj/XQ7frkblyJ926jwkIab6yZw3Eq58rzaz6nMq1RVA+3nMmd73nMMfCkJiRBA7u5O7g6QCFfhyLyVRJg89U3bxKiGJsQ+te6pCge+lETYPT3rujalotqkNLSdexRhJk6lshjOWXeH+WE6Z1HAi+p+Pr+czuxtG0PKlZesd+P09f5xd5iKqrlX1cfpGCiqhDdXr9Ja8DSX24f9/eG4VDGAiAzIIrvpwJ6C96FUXrId15Ivxm8MKCpzKUvRUCpXJTOHO/2Nu6uhqocqLMr4V9iAkxoHMzZjgP7XnMjBZvQLMEROG5iV3IMAAAAASUVORK5CYII="), alt: "Elena at the beach" },
    { id: "2", src: png("iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAIAAACtAwlQAAABZklEQVR42m3MzW4TUQyGYZ8zZzJpwp8UiQ0SEvfMLXETICqoKrXQdDohyZwZ258/FpPCAryyrUdv6j99ZDAiSALLFhFkULhcLAAWFEEA7ggEhYkiImQwWNx84WY+Vh0OZzVvcn657bq25MQIFlOLYCDOY/1+23/59uN0mrZX3Yf3u3dvX6+7VvhcMvXH/vT5+u7rzcM02XrVOvyqbXZvNjmlYmoMqtpY5+EwjqOae4CHX7XWWTerktOl5OYwR5AkKSSXp6sxP5fcPJHrVWlLA0Rpctc2iYQ5/5RgEHLTlbY0qt6WZrsuQrp5SlJMzRG16r4/98M4qyM4m/eH+mqzyilWTVNUfZr0bn+8vn16eDqqeZDm2A9jEgawe7Eu8zQPx+nmfrh/PNbZERQRBCf1n0NtkhQym/lU59N5nu0ilkFQDaeqddLsamZwB/+Cy5CEhzuym8M9KP8iEQkSjgwAAP9LhCQB/AYQ5Y+kAv/RXgAAAABJRU5ErkJggg=="), alt: "Elena with her guitar" },
    { id: "3", src: png("iVBORw0KGgoAAAANSUhEUgAAAAwAAAAQCAIAAACtAwlQAAABaUlEQVR42mWRzW5TQRSDZ+bOTdMoFMGCFWx4SR6OF0EgQVWECmqbNOnNvTPnHNssIn6kemVZn+yF84eP30mKFEWCZwMmnROKrAAIShSIAOECKaWUkhIlkTXMzxDdbT614z7M8jCsNi+G8UI5nyEjKKKfpuOP6931Z5uO4+X26t377Zu3w2otqYY5SZjNu/uHr5/2N1+it7paR0QZLy9evs651DAjCes2n9ph58uMcIH9+Njn07De5jL8bXJ4kJSUJEkU4BFmuQzVzUTCXUplXJdhJFCGWuqFlMIjJ1aYE0SEpLrelDpmtzKMw2ojJpinnGuYMcLavOzv2+MDrItAdHvatc3VKqUyjDV697YsD7fT7bf2eIewJCK8H+6VMoBx86paa/1pP/26WXY/oy+JSCklAt774U65kLm4mS/N5+k8lP5IBMJimaK1AnO6E5HOf/0vSQGElzBHhEilZ1ASRXgUAAD0vOYfhd832o14udpJswAAAABJRU5ErkJggg=="), alt: "Elena at a concert" },
  ]);
  return (
    <PhotoGrid
      className="max-w-sm"
      value={photos}
      onValueChange={setPhotos}
      onAdd={() => undefined}
      required={2}
      labels={{ add: "Add a photo", main: "Main", photo: (n) => `Photo ${n}`, moveEarlier: "Move earlier", moveLater: "Move later", remove: "Remove", moved: (n) => `Moved to place ${n}` }}
    />
  );
}

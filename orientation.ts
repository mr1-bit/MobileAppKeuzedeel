import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
 
type Orientation = "portrait" | "landscape";
 
function getOrientation(): Orientation {
  const { width, height } = Dimensions.get("window");
  return width > height ? "landscape" : "portrait";
}
 
export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(getOrientation);
 
  useEffect(() => {
    const sub = Dimensions.addEventListener("change", () => {
      setOrientation(getOrientation());
    });
    return () => sub?.remove();
  }, []);
 
  return orientation;
}
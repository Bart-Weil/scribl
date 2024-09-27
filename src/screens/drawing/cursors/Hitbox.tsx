type hitBox = {
  x: number,
  y: number,
  width: number,
  height: number,
}

type point = {
  x: number,
  y: number,
}

export const hitTest = (point: point, hitBox: hitBox) => {
  if (point.x < hitBox.x) {
    return false;
  }
  if (point.y < hitBox.y) {
    return false;
  }
  if (point.x > hitBox.x + hitBox.width) {
    return false;
  }
  if (point.y > hitBox.y + hitBox.height) {
    return false;
  }
  return true;
}
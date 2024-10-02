import { Line } from "./Line";
import { Renderer } from "./render/canvas2d/renderer";
import { Camera } from "./stage/Camera";
import { Vector } from "./Vector";

export class Rectangle {
  constructor(
    public location: Vector,
    public size: Vector,
  ) {}

  public get left(): number {
    return this.location.x;
  }

  public get right(): number {
    return this.location.x + this.size.x;
  }

  public get top(): number {
    return this.location.y;
  }

  public get bottom(): number {
    return this.location.y + this.size.y;
  }

  public get center(): Vector {
    return this.location.add(this.size.divide(2));
  }

  public get leftCenter(): Vector {
    return new Vector(this.left, this.center.y);
  }

  public get rightCenter(): Vector {
    return new Vector(this.right, this.center.y);
  }

  public get topCenter(): Vector {
    return new Vector(this.center.x, this.top);
  }

  public get bottomCenter(): Vector {
    return new Vector(this.center.x, this.bottom);
  }

  /**
   * 以中心点为中心，扩展矩形
   * @param amount
   * @returns
   */
  public expandFromCenter(amount: number): Rectangle {
    const halfAmount = amount / 2;
    const newSize = this.size.add(new Vector(amount, amount));
    const newLocation = this.center
      .subtract(newSize.divide(2))
      .subtract(new Vector(halfAmount, halfAmount));
    return new Rectangle(newLocation, newSize);
  }

  public clone(): Rectangle {
    return new Rectangle(this.location.clone(), this.size.clone());
  }

  /**
   * 通过四条边来创建矩形
   * @param left
   * @param top
   * @param right
   * @param bottom
   * @returns
   */
  public static fromEdges(
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): Rectangle {
    const location = new Vector(left, top);
    const size = new Vector(right - left, bottom - top);
    return new Rectangle(location, size);
  }

  /**
   * 通过两个点来创建矩形，可以用于框选生成矩形
   * @param p1
   * @param p2
   * @returns
   */
  public static fromTwoPoints(p1: Vector, p2: Vector): Rectangle {
    const left = Math.min(p1.x, p2.x);
    const top = Math.min(p1.y, p2.y);
    const right = Math.max(p1.x, p2.x);
    const bottom = Math.max(p1.y, p2.y);
    return Rectangle.fromEdges(left, top, right, bottom);
  }

  public static getBoundingRectangle(rectangles: Rectangle[]): Rectangle {
    if (rectangles.length === 0) {
      // 抛出异常
      throw new Error("rectangles is empty");
    }

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const rect of rectangles) {
      left = Math.min(left, rect.left);
      top = Math.min(top, rect.top);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
    }
    return Rectangle.fromEdges(left, top, right, bottom);
  }

  getFroePoints(): Vector[] {
    const points = [
      new Vector(this.left, this.top),
      new Vector(this.right, this.top),
      new Vector(this.right, this.bottom),
      new Vector(this.left, this.bottom),
    ];
    return points;
  }

  /**
   * 和另一个矩形有部分相交（碰到一点点就算）
   */
  public isCollideWith(other: Rectangle): boolean {
    const collision_x = this.right > other.left && this.left < other.right;
    const collision_y = this.bottom > other.top && this.top < other.bottom;
    return collision_x && collision_y;
  }

  /**
   * 自己这个矩形是否和线段有交点
   * 用于节点切割检测
   * @param line
   */
  public isCollideWithLine(line: Line) {
    if (this.isPointInside(line.start) || this.isPointInside(line.end)) {
      return true;
    }
    const topLine = new Line(this.location, this.location.add(new Vector(0, this.size.x)));
    const bottomLine = new Line(
      this.location.add(new Vector(0, this.size.y)),
      this.location.add(this.size),
    );
    const leftLine = new Line(this.location, this.location.add(new Vector(0, this.size.y)));
    const rightLine = new Line(
      this.location.add(new Vector(this.size.x, 0)),
      this.location.add(this.size),
    );
    return (
      line.isIntersecting(topLine) ||
      line.isIntersecting(bottomLine) ||
      line.isIntersecting(leftLine) ||
      line.isIntersecting(rightLine)
    );
  }

  /**
   * 是否完全在另一个矩形内
   * AI写的，有待测试
   * @param other
   * @returns
   */
  public isInOther(other: Rectangle): boolean {
    const collision_x = this.left > other.left && this.right < other.right;
    const collision_y = this.top > other.top && this.bottom < other.bottom;
    return collision_x && collision_y;
  }

  /**
   * 判断点是否在矩形内
   */
  public isPointInside(point: Vector): boolean {
    const collision_x = this.left <= point.x && this.right >= point.x;
    const collision_y = this.top <= point.y && this.bottom >= point.y;
    return collision_x && collision_y;
  }

  /**
   *
   * @param scale
   * @returns
   */

  public multiply(scale: number): Rectangle {
    return new Rectangle(
      this.location.multiply(scale),
      this.size.multiply(scale),
    );
  }

  public toString(): string {
    return `[${this.location.toString()}, ${this.size.toString()}]`;
  }

  public getCenter(): Vector {
    return this.location.add(this.size.divide(2));
  }

  static fromPoints(p1: Vector, p2: Vector): Rectangle {
    const location = p1.clone();
    const size = p2.clone().subtract(p1);
    return new Rectangle(location, size);
  }

  public transformWorld2View(): Rectangle {
    return new Rectangle(
      Renderer.transformWorld2View(this.location),
      // Renderer.transformWorld2View(this.size),
      this.size.multiply(Camera.currentScale),
    );
  }

  public transformView2World(): Rectangle {
    return new Rectangle(
      Renderer.transformView2World(this.location),
      Renderer.transformView2World(this.size),
    );
  }
}
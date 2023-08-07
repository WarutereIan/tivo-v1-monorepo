import { Response } from "express";

export interface IClient {
  id: number;
  response: Response;
}

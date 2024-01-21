/** @format */
import { ReportSubject } from '../../models/report.model';

export interface ReportCreateDto {
	name: string;
	description: string;
	subject: ReportSubject;
}

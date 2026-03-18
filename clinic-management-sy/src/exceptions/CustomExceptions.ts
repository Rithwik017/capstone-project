export abstract class BaseException extends Error {
  public readonly timestamp: string
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.timestamp = new Date().toISOString()

    Object.setPrototypeOf(this, new.target.prototype)
  }

  public toJson(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp
    }
  }
}

export class DoubleBookingException extends BaseException {
  public readonly doctorName: string
  public readonly appointmentDateTime: string

  constructor(doctorName: string, appointmentDateTime: string) {
    const message = `Double booking detected: ${doctorName} is already booked at ${new Date(appointmentDateTime).toLocaleString()}`
    super(message, 'DOUBLE_BOOKING')
    this.doctorName = doctorName
    this.appointmentDateTime = appointmentDateTime
  }

  public override toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      doctorName: this.doctorName,
      appointmentDateTime: this.appointmentDateTime
    }
  }
}

export class InvalidStatusTransitionException extends BaseException {
  public readonly currentStatus: string
  public readonly attemptedStatus: string

  constructor(currentStatus: string, attemptedStatus: string) {
    const message = `Invalid status transition: Cannot change from ${currentStatus} to ${attemptedStatus}`
    super(message, 'INVALID_STATUS_TRANSITION')
    this.currentStatus = currentStatus
    this.attemptedStatus = attemptedStatus
  }

  public override toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      currentStatus: this.currentStatus,
      attemptedStatus: this.attemptedStatus
    }
  }
}

export class EntityNotFoundException extends BaseException {
  public readonly entityType: string
  public readonly entityId: string

  constructor(entityType: string, entityId: string) {
    const message = `${entityType} with ID ${entityId} not found`
    super(message, 'ENTITY_NOT_FOUND')
    this.entityType = entityType
    this.entityId = entityId
  }

  public override toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      entityType: this.entityType,
      entityId: this.entityId
    }
  }
}

export class ValidationException extends BaseException {
  public readonly fieldErrors: Record<string, string>

  constructor(fieldErrors: Record<string, string>) {
    const message = `Validation failed: ${Object.values(fieldErrors).join(', ')}`
    super(message, 'VALIDATION_ERROR')
    this.fieldErrors = fieldErrors
  }

  public override toJson(): Record<string, unknown> {
    return {
      ...super.toJson(),
      fieldErrors: this.fieldErrors
    }
  }
}


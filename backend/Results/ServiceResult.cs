namespace Nexora.Api.Results;

public class ServiceResult
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public IEnumerable<string> Errors { get; set; } = [];
    public bool IsNotFound { get; set; }
    public bool IsForbidden { get; set; }
    public bool IsConflict { get; set; }

    public static ServiceResult Success(string message = "")
        => new() { Succeeded = true, Message = message };

    public static ServiceResult Fail(string message)
        => new() { Succeeded = false, Message = message };

    public static ServiceResult NotFound(string message)
        => new() { Succeeded = false, IsNotFound = true, Message = message };

    public static ServiceResult Forbidden(string message)
        => new() { Succeeded = false, IsForbidden = true, Message = message };

    public static ServiceResult Conflict(string message)
        => new() { Succeeded = false, IsConflict = true, Message = message };
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; set; }

    public static ServiceResult<T> Success(T data, string message = "")
        => new() { Succeeded = true, Data = data, Message = message };

    public new static ServiceResult<T> Fail(string message)
        => new() { Succeeded = false, Message = message };

    public new static ServiceResult<T> NotFound(string message)
        => new() { Succeeded = false, IsNotFound = true, Message = message };

    public new static ServiceResult<T> Forbidden(string message)
        => new() { Succeeded = false, IsForbidden = true, Message = message };

    public new static ServiceResult<T> Conflict(string message)
        => new() { Succeeded = false, IsConflict = true, Message = message };
}

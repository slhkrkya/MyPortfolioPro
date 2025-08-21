using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace API.Infrastructure.Swagger;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var fileParameters = context.ApiDescription.ParameterDescriptions
            .Where(x => x.ModelMetadata?.ModelType == typeof(IFormFile));

        foreach (var parameter in fileParameters)
        {
            var openApiParameter = operation.Parameters.FirstOrDefault(x => x.Name == parameter.Name);
            if (openApiParameter != null)
            {
                operation.Parameters.Remove(openApiParameter);
            }

            // File upload için content type'ı ayarla
            operation.RequestBody = new OpenApiRequestBody
            {
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["multipart/form-data"] = new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = new Dictionary<string, OpenApiSchema>
                            {
                                ["file"] = new OpenApiSchema
                                {
                                    Type = "string",
                                    Format = "binary",
                                    Description = "Upload file"
                                },
                                ["fileName"] = new OpenApiSchema
                                {
                                    Type = "string",
                                    Description = "Optional custom file name"
                                }
                            }
                        }
                    }
                }
            };
        }
    }
} 